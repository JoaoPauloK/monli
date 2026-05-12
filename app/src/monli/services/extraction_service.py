# Copyright (c) 2026 Monli. All rights reserved.

import json
import io
import os
from uuid import UUID

from google import genai
from google.genai import errors
from sqlmodel import Session
from PIL import Image

from monli.database import get_session
from monli.repositories.ingredient_repository import IngredientRepository
from monli.settings import settings

os.environ["GEMINI_API_KEY"] = settings.gemini_api_key
client = genai.Client(http_options={"api_version": "v1beta"})

async def extract_purchase_data_from_image(image_bytes: bytes, tenant_id: UUID, session: Session | None = None) -> dict:
    """Extract purchase data from an image using Google Gemini, augmented with ingredient matching."""
    if session is None:
        async for s in get_session():
            session = s
            break
    assert session is not None
    ingredient_repo = IngredientRepository(session, tenant_id)
    ingredients = ingredient_repo.list(limit=1000)
    
    ingredient_list = ", ".join(f"{ing.id}: {ing.name}" for ing in ingredients)
    if not ingredient_list:
        ingredient_list = "Nenhum ingrediente cadastrado."
    
    prompt = (
        f"Você é um assistente que extrai dados estruturados de recibos de compras. "
        f"Dada uma imagem de recibo, identifique:\n"
        f"- Data da compra (sempre no formato 'YYYY-MM-DD')\n"
        f"- Valor Unitário\n"
        f"- Lista de itens comprados (nome, quantidade, preço, unidade)\n"
        f"\n"
        f"Lista de ingredientes existentes no sistema (para matching): {ingredient_list}\n"
        f"Tente corresponder os nomes dos itens comprados com os ingredientes existentes (baseado em similaridade de nomes). "
        f"Se houver correspondência, inclua o ID do ingrediente correspondente no campo 'matched_ingredient_id'. "
        f"Se não houver, marque 'is_new_ingredient' como true.\n"
        f"\n"
        f"Retorne em JSON. Se não conseguir extrair, retorne um objeto vazio."
        f"Se qualquer extração falhar, retorne valor nulo ou string vazia para aquele campo, mas tente extrair o máximo possível dos outros campos."
        f"Não adicione caracteres especiais, sem caraceteres de quebra de linha ou formatação extra no JSON, apenas o objeto JSON puro, numa unica linha pronto para fazer parse."
        f"A resposta deve seguir a seguinte estrutura:\n"
        f"{{\n"
        f'  "purchase_date": "...",\n'
        f'  "total_amount": 0.0,\n'
        f'  "items": [\n'
        f'    {{\n'
        f'      "name": "...",\n'
        f'      "quantity": 0.0,\n'
        f'      "price": 0.0,\n'
        f'      "unit": "kg",\n'
        f'      "matched_ingredient_id": "uuid-ou-null",\n'
        f'      "is_new_ingredient": true/false\n'
        f'    }}\n'
        f'  ]\n'
        f"}}"
    )
    
    generation_config = {"max_output_tokens": 3000, "response_mime_type": "application/json"}

    def parse_response(text: str) -> dict:
        text = text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()
        return json.loads(text)

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=[prompt, Image.open(io.BytesIO(image_bytes))],
            config=generation_config,
        )
        assert response.text is not None
        return parse_response(response.text)
    except errors.ServerError as e:
        if '503' in str(e):
            response = client.models.generate_content(
                model=settings.gemini_model_fallback,
                contents=[prompt, Image.open(io.BytesIO(image_bytes))],
                config=generation_config,
            )
            assert response.text is not None
            return parse_response(response.text)
    return {}