interface Props {
  message: string;
}

export default function ErrorPage({ message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="text-2xl font-bold mb-2">⚠️ Link Expired or Invalid</h2>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
