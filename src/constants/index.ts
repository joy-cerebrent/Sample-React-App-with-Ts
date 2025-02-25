import {
  House,
  Link,
  NotepadText,
  Paperclip
} from "lucide-react";

export const pageRoutes = [
  {
    name: 'Home',
    path: '/',
    icon: House,
  },
  {
    name: 'Form Generator',
    path: '/form-generator',
    icon: NotepadText,
  },
  {
    name: 'Search *',
    path: '/search',
    icon: Paperclip,
  },
  {
    name: 'Socket.io *',
    path: '/socket',
    icon: Link,
  },
];