import { GetServiceListDto } from "./service.dto";
import { Service } from "./service.model";

const serviceService = {
    async getServicesList(data: GetServiceListDto) {
      return await Service.find();
    },
    async createService(data: any) {
      const service = await Service.create(data);
      return service;
    },
    async getServiceById(id: string) {
        const service = await Service.findById(id);
        return service;
    },
    async updateServiceById(id: string, data: any) {
        const service = await Service.findByIdAndUpdate(id, data, { new: true });
        return service;
    },
    async deleteServiceById(id: string) {
        await Service.findByIdAndDelete(id);
    }
}

export default serviceService;