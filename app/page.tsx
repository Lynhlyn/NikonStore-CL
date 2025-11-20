import HomeBanner from "@/components/banner/HomeBanner"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Home Banner Section - Position 0 (Top) */}
      <HomeBanner position={0} />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
          <h1 className="text-4xl font-bold text-center mb-8">
            Welcome to Nikon Store
          </h1>
          <p className="text-center text-muted-foreground">
            Your trusted destination for Nikon products
          </p>
        </div>
      </div>
    </main>
  );
}

