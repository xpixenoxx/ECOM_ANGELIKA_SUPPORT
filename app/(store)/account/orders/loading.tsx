export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-[#EFEAE2] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-44 rounded bg-[#DFD6C9]" />
          <div className="h-3 w-36 rounded bg-[#DFD6C9]" />
        </div>
        <div className="space-y-2">
          <div className="h-10 w-52 rounded-lg bg-[#DFD6C9]" />
          <div className="h-4 w-80 rounded bg-[#E6DED2]" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2]" />
          ))}
        </div>
        <div className="h-16 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2]" />
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2]" />
          ))}
        </div>
      </div>
    </div>
  );
}
