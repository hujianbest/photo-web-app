import Link from 'next/link';
import Image from 'next/image';

interface WorkCardProps {
  work: {
    id: number;
    title: string;
    description: string;
    images: string[];
    user: {
      id: number;
      username: string;
      avatar_url: string;
    };
    likes: number;
    views: number;
    created_at: string;
  };
}

export function WorkCard({ work }: WorkCardProps) {
  const coverImage = work.images?.[0] || '/placeholder.jpg';

  return (
    <Link href={`/works/${work.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
        <div className="relative aspect-square">
          <Image
            src={coverImage}
            alt={work.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">
            {work.title}
          </h3>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {work.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {work.user.avatar_url ? (
                <Image
                  src={work.user.avatar_url}
                  alt={work.user.username}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">
                  {work.user.username[0].toUpperCase()}
                </div>
              )}
              <span className="text-sm text-gray-700">
                {work.user.username}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>❤️ {work.likes}</span>
              <span>👁️ {work.views}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}