import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, Res } from '@nestjs/common';
import { BoardService } from './board.service';
import { Public } from '../../decorator';
import { CreateBoardDto, UpdateBoardDto } from '../../type/dto';
import { Request, Response } from 'express';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Public()
  @Get()
  async getBoardList() {
    return await this.boardService.getBoardList();
  }

  @Public()
  @Get(':seq')
  async getBoardDetail(@Param('seq', ParseIntPipe) seq: number) {
    return await this.boardService.getBoardDetail(seq);
  }

  @Post()
  async createBoard(@Body() dto: CreateBoardDto, @Req() req: Request, @Res() res: Response) {
    return await this.boardService.createBoard({ dto, req, res });
  }

  @Patch(':boardSeq')
  async updateBoard(
    @Param('boardSeq', ParseIntPipe) boardSeq: number,
    @Body() dto: UpdateBoardDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.boardService.updateBoard({ boardSeq, dto, req, res });
  }
}
