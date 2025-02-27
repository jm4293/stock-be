import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, Res } from '@nestjs/common';
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
  async getBoardList(@Query('page', ParseIntPipe) page: number, @Res() res: Response) {
    const ret = await this.boardService.getBoardList(page);

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Public()
  @Get(':boardSeq')
  async getBoardDetail(@Param('boardSeq', ParseIntPipe) boardSeq: number, @Res() res: Response) {
    const ret = await this.boardService.getBoardDetail(boardSeq);

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Post()
  async createBoard(@Body() dto: CreateBoardDto, @Req() req: Request, @Res() res: Response) {
    await this.boardService.createBoard({ dto, req });

    return ResConfig.Success({ res, statusCode: 'CREATED' });
  }

  @Put(':boardSeq')
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
