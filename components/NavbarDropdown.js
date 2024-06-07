import { Dropdown, Avatar } from "flowbite-react";
import { useSession, signOut } from "next-auth/react";
import AvatarImage from "../components/AvatarImage";

export default function NavbarDropdown() {
  const { data: session } = useSession();
  const userImage = null;

  return (
    <Dropdown
      arrowIcon={false}
      inline
      label={
        <AvatarImage
          customImage={session?.user.picture}
          customName={session?.user.firstName}
        />
      }
    >
      <Dropdown.Header>
        <span className="block text-sm">{`${session?.user.firstName} ${session?.user.lastName}`}</span>
        <span className="block truncate text-sm font-medium">
          {session?.user.email}
        </span>
      </Dropdown.Header>

      <Dropdown.Divider />
      <Dropdown.Item onClick={() => signOut()}>Sign out</Dropdown.Item>
    </Dropdown>
  );
}
