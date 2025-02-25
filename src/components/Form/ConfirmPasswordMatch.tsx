export default function ConfirmPasswordMatch({
  password,
  confirmPassword
}: {
  password: string;
  confirmPassword: string
}) {
  const isMatch = password === confirmPassword && confirmPassword.length > 0;

  return (
    <p className={`text-sm ${isMatch ? "text-green-500" : "text-zinc-400"} -mt-2`}>
      {isMatch ? "✔ Passwords match" : confirmPassword.length > 0 ? "✖ Passwords do not match" : ""}
    </p>
  );
};