interface Props {
  message: string;
}

export default function ErrorPage({ message }: Props) {
  return (
    <div className="error-wrapper">
      <h2>⚠️ Link Expired or Invalid</h2>
      <p>{message}</p>
      <a href="/">Go Home</a>
    </div>
  );
}