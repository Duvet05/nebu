import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Controller('internal')
export class InternalController {
  @Post('seed-products')
  @HttpCode(HttpStatus.OK)
  async seedProducts() {
    try {
      const script = '/app/scripts/seed-products.sh';
      const { stdout, stderr } = await execAsync(`sh ${script}`);
      
      return {
        success: true,
        output: stdout,
        errors: stderr || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: error.stdout,
        errors: error.stderr,
      };
    }
  }
}
