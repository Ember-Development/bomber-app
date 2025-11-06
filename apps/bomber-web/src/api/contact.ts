import { api } from './Client';

type ContactData = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export async function submitContact(data: ContactData) {
  const response = await api.post('/contact', data);
  return response.data;
}
