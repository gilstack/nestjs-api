export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    username: string;
    tag: string;
    name: string | null;
    image: string | null;
    role: string;
    status: string;
  };
}
