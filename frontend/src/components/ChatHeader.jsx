const ChatHeader = ({selectedPersona}) => {
    return (
      <div className="flex items-center justify-between p-2 lg:p-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative">
            <img
              src={selectedPersona.avatar || "/avatars/default-custom.png"}
              alt={selectedPersona.name}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full avatar shadow-md"
              onError={(e) => {
                e.target.src = "/avatars/default-custom.png";
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                {selectedPersona.name}
              </h2>
              
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {selectedPersona.isCustom
                ? "Your Personal Friend"
                : "Your Friend"}
            </p>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Open sidebar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    );
}

export default ChatHeader;