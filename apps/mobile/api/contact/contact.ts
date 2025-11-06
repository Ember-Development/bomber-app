import { api } from '../api';

type ContactData = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export async function submitContact(data: ContactData) {
  const response = await api.post('/api/contact', data);
  return response.data;
}
