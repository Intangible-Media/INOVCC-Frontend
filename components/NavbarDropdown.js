import { Dropdown, Avatar } from "flowbite-react";
import { useSession, signOut } from "next-auth/react";

export default function NavbarDropdown() {
  const { data: session } = useSession();
  const userImage = null;
  const AvatarImage = () => {
    return (
      <>
        {userImage ? (
          <Avatar
            alt="User settings"
            img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
            rounded
          />
        ) : (
          <Avatar
            placeholderInitials={session?.user.firstName.slice(0, 1)}
            rounded
          />
        )}
      </>
    );
  };

  return (
    <Dropdown arrowIcon={false} inline label={<AvatarImage />}>
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
