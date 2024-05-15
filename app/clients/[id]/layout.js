import { ClientProvider } from "../../../context/ClientContext";

export default function Layout({ children }) {
  return (
    <div>
      <ClientProvider>{children}</ClientProvider>
    </div>
  );
}
