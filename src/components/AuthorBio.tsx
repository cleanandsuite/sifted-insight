import { User } from 'lucide-react';

interface AuthorBioProps {
  author: string;
  publication: string;
}

export const AuthorBio = ({ author, publication }: AuthorBioProps) => {
  if (author === 'Unknown' || !author) return null;

  return (
    <div className="border border-border-strong bg-card p-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-secondary border border-border-strong flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <h4 className="font-medium mb-1">{author}</h4>
          <p className="terminal-text text-muted-foreground mb-2">
            Writer at {publication}
          </p>
          <p className="text-sm text-muted-foreground">
            Contributing writer covering technology, innovation, and the future of digital media.
          </p>
        </div>
      </div>
    </div>
  );
};
