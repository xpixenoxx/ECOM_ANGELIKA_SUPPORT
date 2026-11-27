export default function WishlistLoading() {
  return (
    <div className="min-h-screen bg-[#EFEAE2] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="h-4 w-44 rounded bg-[#DFD6C9]" />
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="h-10 w-56 rounded-lg bg-[#DFD6C9]" />
            <div className="h-4 w-72 rounded bg-[#E6DED2]" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-[#FFFFFF] border border-[#E5DDD2]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2] overflow-hidden">
              <div className="aspect-[3/4] bg-[#E8E0D5]" />
              <div className="p-4 space-y-2.5">
                <div className="h-4 w-3/4 rounded bg-[#E8E0D5]" />
                <div className="h-5 w-1/3 rounded bg-[#E8E0D5]" />
                <div className="h-9 w-full rounded-xl bg-[#EFEAE2]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
