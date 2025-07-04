import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">File Swap</h1>
          <p className="text-gray-600">
            Securely exchange files with another person
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              How it works
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                <span>You upload your file</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                <span>Share the link with someone</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                <span>They upload their file</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">4</div>
                <span>Both files become available</span>
              </div>
            </div>
          </div>

          <Link
            href="/upload"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            Start New Swap
          </Link>
          
          <div className="text-center text-xs text-gray-500">
            <p>• Files expire after 24 hours</p>
            <p>• Maximum file size: 10MB</p>
            <p>• No registration required</p>
          </div>
        </div>
      </div>
    </div>
  );
}
