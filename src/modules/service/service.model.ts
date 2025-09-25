import mongoose, { Schema } from "mongoose";

export interface ServiceI {
  name: string;
  duration: number; // in minutes
  price: number; // in euros
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<ServiceI>(
  {
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const Service = mongoose.model<ServiceI>('Service', serviceSchema);