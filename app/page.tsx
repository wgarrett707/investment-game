import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-[#34d399]">Welcome to Seed or Skip</h1>
        <p className="text-xl mb-8 text-[#a7f3d0]">Experience the thrill of startup investing in a simulated environment</p>
        
        <div className="space-y-4">
          <Link 
            href="/register" 
            className="inline-block bg-[#10b981] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#059669] transition-colors"
          >
            Get Started
          </Link>
          <div className="mt-4">
            <Link 
              href="/login" 
              className="text-[#34d399] hover:text-[#a7f3d0]"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <div className="p-6 bg-[#0a2618]/80 backdrop-blur-sm rounded-lg shadow-md border border-[#10b981]/20">
          <h2 className="text-xl font-semibold mb-2 text-[#34d399]">Learn Investment</h2>
          <p className="text-[#a7f3d0]">Understand how startup investing works through hands-on experience</p>
        </div>
        <div className="p-6 bg-[#0a2618]/80 backdrop-blur-sm rounded-lg shadow-md border border-[#10b981]/20">
          <h2 className="text-xl font-semibold mb-2 text-[#34d399]">Compete with Teams</h2>
          <p className="text-[#a7f3d0]">Join a team and compete against others to make the best investments</p>
        </div>
        <div className="p-6 bg-[#0a2618]/80 backdrop-blur-sm rounded-lg shadow-md border border-[#10b981]/20">
          <h2 className="text-xl font-semibold mb-2 text-[#34d399]">Real Startup Cases</h2>
          <p className="text-[#a7f3d0]">Invest in real historical AI startups and learn from their outcomes</p>
        </div>
      </div>
    </div>
  )
}
