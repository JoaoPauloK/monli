import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import SideNav from './SideNav'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav />
      <div className="flex flex-1 flex-col lg:pl-56">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
