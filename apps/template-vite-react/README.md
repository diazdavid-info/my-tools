## Instalación
1. Instalar template de Vitejs `pnpm create vite`
   1. Vanilla con Typescript
2. Instalar el plugin de Vitejs para Reactjs `pnpm add -D @vitejs/plugin-react-swc`
3. Instalar las librerías de Reactjs `pnpm add react react-dom`
4. Crear fichero de configuración para Vitejs
   ```
   // vite.config.ts
   
   import {defineConfig} from 'vite'
   import react from '@vitejs/plugin-react-swc'
   
   export default defineConfig({
   plugins: [react()]
   })
   ```
5. Crear punto de entrada
   ```
   // main.tsx
   
   import './style.css'
   import ReactDOM from 'react-dom/client'
   
   ReactDOM.createRoot(document.getElementById('app')!)
     .render(<h1>Hola Mundo</h1>)
   
   ```
6. Añadir jsx en la config de ts
   ```
   // tsconfig.json
   
   "jsx": "react-jsx",
   ```
7. Añadir eslint
