export default function OrderDetailLoading() {
  return (
    <div className="min-h-screen bg-[#EFEAE2] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="h-4 w-40 rounded bg-[#DFD6C9]" />
        <div className="h-36 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2]" />
        <div className="h-28 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2]" />
          <div className="space-y-4">
            <div className="h-48 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2]" />
            <div className="h-44 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2]" />
          </div>
        </div>
      </div>
    </div>
  );
}
