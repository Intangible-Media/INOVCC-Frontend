import { ClientProvider } from "../../../context/clientContext";

export default function Layout({ children }) {
  return (
    <div>
      <ClientProvider>{children}</ClientProvider>
    </div>
  );
}
