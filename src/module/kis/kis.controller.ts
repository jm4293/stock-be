import { Controller, Delete, Get } from '@nestjs/common';
import { KisService } from './kis.service';

@Controller('kis')
export class KisController {
  constructor(private readonly kisService: KisService) {}

  @Get('oauth/token')
  postOuathToken() {
    return this.kisService.postOuathToken();
  }

  @Delete('oauth/revoke')
  deleteOuathToken() {
    return this.kisService.deleteOuathToken();
  }
}
