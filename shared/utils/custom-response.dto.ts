export class CustomResponseDto {
  message: string;
  statusCode: number;
  data: any;
  time: Date;
  success: boolean;

  constructor() {
    this.data = [];
    this.time = new Date();
  }
}
