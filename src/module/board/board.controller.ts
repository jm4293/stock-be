import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, Res } from '@nestjs/common';
import { BoardService } from './board.service';
import { Public } from '../../decorator';
import { CreateBoardDto, UpdateBoardDto } from '../../type/dto';
import { Request, Response } from 'express';
import { ResConfig } from '../../config';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Public()
  @Get()
  async getBoardList(@Res() res: Response) {
    const ret = await this.boardService.getBoardList();

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Public()
  @Get(':seq')
  async getBoardDetail(@Param('seq', ParseIntPipe) seq: number, @Res() res: Response) {
    const ret = await this.boardService.getBoardDetail(seq);

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Post()
  async createBoard(@Body() dto: CreateBoardDto, @Req() req: Request, @Res() res: Response) {
    await this.boardService.createBoard({ dto, req });

    return ResConfig.Success({ res, statusCode: 'CREATED' });
  }

  @Patch(':boardSeq')
  async updateBoard(
    @Param('boardSeq', ParseIntPipe) boardSeq: number,
    @Body() dto: UpdateBoardDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.boardService.updateBoard({ boardSeq, dto, req });

    return ResConfig.Success({ res, statusCode: 'OK' });
  }

  @Delete(':boardSeq')
  async deleteBoard(@Param('boardSeq', ParseIntPipe) boardSeq: number, @Req() req: Request, @Res() res: Response) {
    await this.boardService.deleteBoard({ boardSeq, req });

    return ResConfig.Success({ res, statusCode: 'OK' });
  }
}
