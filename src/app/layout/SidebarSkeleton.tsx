export function SidebarSkeleton() {
  return (
    <aside className="sticky top-0 h-screen w-72 bg-white shadow-lg">
      <div className="flex h-full animate-pulse flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex h-20 items-center p-6">
          <div className="h-6 w-32 rounded bg-gray-200"></div>
        </div>

        {/* Menu */}
        <div className="flex-1 px-4 space-y-6">
          {/* Menu Group 1 */}
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-gray-200 px-4"></div>
            <ul className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="h-6 w-6 rounded-md bg-gray-200"></div>
                  <div className="h-5 w-40 rounded bg-gray-200"></div>
                </li>
              ))}
            </ul>
          </div>
          {/* Menu Group 2 */}
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-gray-200 px-4"></div>
            <ul className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="h-6 w-6 rounded-md bg-gray-200"></div>
                  <div className="h-5 w-40 rounded bg-gray-200"></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}