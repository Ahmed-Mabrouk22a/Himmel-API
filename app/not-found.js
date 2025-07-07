import Link from 'next/link';
import { TbUnlink } from 'react-icons/tb';

export default function Custom404() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#0f0f12] text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-50px] left-[-50px] w-72 h-72 bg-purple-500/20 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-72 h-72 bg-pink-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 md:p-12 shadow-2xl max-w-lg w-full">
        <div className="mb-6">
          <TbUnlink className="w-20 h-20 text-purple-400" />
        </div>
        <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-2">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-gray-300 mb-8 max-w-sm">
          Maaf, halaman yang Anda cari tidak ada atau mungkin telah dipindahkan.
        </p>
        <Link href="/" legacyBehavior>
          <a className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
            Kembali ke Beranda
          </a>
        </Link>
      </div>
    </div>
  );
}
