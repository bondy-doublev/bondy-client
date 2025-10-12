import React from "react";

export default function UserName({ fullname }: { fullname: string }) {
  return (
    <p className="font-semibold hover:underline cursor-pointer">{fullname}</p>
  );
}
