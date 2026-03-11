import { Link } from 'react-router-dom';

export const NotFound = () => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
            <div className="max-w-md text-center">
                <h1 className="text-7xl font-bold text-primary mb-4 tracking-widest">404</h1>
                <h2 className="text-2xl font-bold text-text-primary mb-3 tracking-widest uppercase">
                    Page Not Found
                </h2>
                <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link
                    to="/"
                    className="inline-block px-8 py-3 bg-primary text-black font-bold tracking-widest uppercase text-sm rounded hover:bg-highlight transition-colors"
                >
                    Back to Collection
                </Link>
            </div>
        </div>
    );
};
