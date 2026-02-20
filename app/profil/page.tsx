import dynamic from 'next/dynamic'

const ProfilPageInner = dynamic(() => import('./ProfilPage'), { ssr: false })

export default function ProfilPage() {
  return <ProfilPageInner />
}
