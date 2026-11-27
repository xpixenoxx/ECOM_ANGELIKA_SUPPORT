export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-[#EFEAE2] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="h-36 rounded-2xl bg-[#161310]/90 border border-[#C9A84C]/25" />
        <div className="h-12 rounded-xl bg-[#FFFFFF] border border-[#E5DDD2]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-32 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2]" />
          <div className="h-32 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2]" />
          <div className="h-32 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2]" />
        </div>
        <div className="h-64 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD2]" />
      </div>
    </div>
  );
}
