<div className="flex items-center gap-4">
  <div className="flex items-center">
    <UserIcon className="h-6 w-6 text-gray-600" />
    <span className="ml-2 text-gray-900">{username}</span>
  </div>
  <Link
    to="/user-management"
    className="flex items-center text-gray-600 hover:text-gray-900"
  >
    <Users2 className="h-5 w-5" />
    <span className="ml-2">User Management</span>
  </Link>
  <Link
    to="/log-book"
    className="flex items-center text-gray-600 hover:text-gray-900"
  >
    <ClipboardList className="h-5 w-5" />
    <span className="ml-2">Log Book</span>
  </Link>
  <button
    onClick={handleLogout}
    className="flex items-center text-gray-600 hover:text-gray-900"
  >
    <LogOut className="h-5 w-5" />
    <span className="ml-2">Logout</span>
  </button>
</div> 