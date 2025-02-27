import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { BoardService } from './board.service';
import { Public } from '../../decorator';

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
}
