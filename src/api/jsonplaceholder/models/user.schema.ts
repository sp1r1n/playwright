import { z } from 'zod';

/**
 * User schema for JSONPlaceholder API
 */
const geoSchema = z.object({
  lat: z.string(),
  lng: z.string(),
});

const addressSchema = z.object({
  street: z.string(),
  suite: z.string(),
  city: z.string(),
  zipcode: z.string(),
  geo: geoSchema,
});

const companySchema = z.object({
  name: z.string(),
  catchPhrase: z.string(),
  bs: z.string(),
});

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  address: addressSchema,
  phone: z.string(),
  website: z.string(),
  company: companySchema,
});

export const usersArraySchema = z.array(userSchema);

/**
 * Types inferred from schemas
 */
export type User = z.infer<typeof userSchema>;
export type Address = z.infer<typeof addressSchema>;
export type Company = z.infer<typeof companySchema>;
export type Geo = z.infer<typeof geoSchema>;
