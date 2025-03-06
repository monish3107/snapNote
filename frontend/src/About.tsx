
const About = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        About <span className="text-blue-600">snapNote</span>
      </h1>
      <p className="text-gray-600 leading-relaxed mb-6">
        snapNote is a powerful tool that allows you to extract text from images using Google Cloud Vision API.
        Whether you're digitizing documents, extracting text from photos, or just experimenting with OCR technology,
        snapNote makes it easy and efficient.
      </p>

      {/* Features Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-700 mb-3">🚀 Features</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>🔍 Extract text from images with high accuracy.</li>
          <li>🖼️ Supports multiple image formats (JPEG, PNG, etc.).</li>
          <li>💰 Free usage with limited credits or use your own API key for unlimited access.</li>
          <li>🎯 User-friendly interface with real-time feedback.</li>
        </ul>
      </div>

      {/* How to Use Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-700 mb-3">📖 How to Use</h2>
        <ol className="list-decimal list-inside text-gray-600 space-y-2">
          <li>🔑 Login with your Google account.</li>
          <li>📷 Upload an image containing text.</li>
          <li>📝 Click <span className="font-semibold text-blue-500">"Extract Text"</span> to process the image.</li>
          <li>📋 View the extracted text and copy it to your clipboard.</li>
        </ol>
      </div>

      {/* API Key Info */}
      <div className="bg-blue-100 p-4 rounded-lg text-gray-700">
        <h3 className="font-semibold text-lg">🔑 Want More Free Uses?</h3>
        <p className="text-gray-600 mt-2">
          For advanced users, you can add your own <span className="font-semibold">Google Cloud Vision API key </span> 
          to bypass the free usage limits. Visit your <span className="font-semibold text-blue-600">Profile</span> page after logging in.
        </p>
      </div>
    </div>
  );
};

export default About;
