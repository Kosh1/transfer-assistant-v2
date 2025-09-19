import { Metadata } from 'next';
import { generateSEOMetadata } from '../../lib/seo';

export const metadata: Metadata = {
  ...generateSEOMetadata(),
  title: 'Privacy Policy | Transfer Assistant',
  description: 'Privacy Policy for Transfer Assistant - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
