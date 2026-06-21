import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ProseProps = {
  content: string;
};

export function Prose({ content }: ProseProps) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
