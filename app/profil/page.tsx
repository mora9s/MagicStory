import dynamic from 'next/dynamic'

const ProfilPage = dynamic(() => import('./ProfilPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
})

export default ProfilPage
