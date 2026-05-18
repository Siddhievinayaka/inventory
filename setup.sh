#!/bin/bash
# Complete project setup script

# Create directory structure
mkdir -p client/app/{login,dashboard,products/\[id\],add-product,api/{auth,products,ai}}
mkdir -p client/{components/{layout,forms,ui,shared},lib,styles}
mkdir -p server/{models,lib,middleware}

# Create client files
cat > client/app/globals.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { @apply scroll-smooth; }
  body { @apply bg-gray-50 text-gray-900 font-sans; }
}

@layer components {
  .btn-primary { @apply px-4 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors; }
  .btn-secondary { @apply px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50; }
  .card { @apply bg-white rounded-lg shadow-sm-soft border border-gray-200; }
  .input-field { @apply w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500; }
}
EOF

echo "Project structure created successfully!"
