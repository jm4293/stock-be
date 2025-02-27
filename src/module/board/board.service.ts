import { Injectable } from '@nestjs/common';
import { BoardCommentRepository, BoardRepository, UserRepository } from '../../database/repository';
import { ResConfig } from '../../config';
import { CreateBoardDto, UpdateBoardDto } from '../../type/dto';
import { Request, Response } from 'express';

@Injectable()
export class BoardService {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly boardCommentRepository: BoardCommentRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async getBoardList() {
    const [boardList, total] = await this.boardRepository.findAndCount({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    return { boardList, total };
  }

  async getBoardDetail(boardSeq: number) {
    const board = await this.boardRepository.findOne({
      where: { boardSeq },
      relations: ['user'],
    });

    if (!board) {
      throw ResConfig.Fail_400({ message: '게시물이 존재하지 않습니다.' });
    }

    const commentList = await this.boardCommentRepository.find({
      where: { board: { boardSeq }, isDeleted: false },
      order: { createdAt: 'ASC' },
      relations: ['user'],
    });

    return { board, commentList };
  }

  async createBoard(params: { dto: CreateBoardDto; req: Request; res: Response }) {
    const { dto, req, res } = params;
    const { userSeq } = req.user;

    const user = await this.userRepository.findUserByUserSeq(userSeq);

    const board = this.boardRepository.create({ ...dto, user });

    await this.boardRepository.save(board);

    return ResConfig.Success({
      res,
      statusCode: 'CREATED',
      message: '게시물이 등록되었습니다.',
      data: { boardSeq: board.boardSeq },
    });
  }

  async updateBoard(params: { boardSeq: number; dto: UpdateBoardDto; req: Request; res: Response }) {
    const { boardSeq, dto, req, res } = params;
    const { userSeq } = req.user;

    const user = await this.userRepository.findUserByUserSeq(userSeq);

    const board = await this.boardRepository.findBoardByBoardSeq(boardSeq);

    if (board.user.userSeq !== user.userSeq) {
      throw ResConfig.Fail_400({ message: '게시물 작성자만 수정할 수 있습니다.' });
    }

    await this.boardRepository.update({ boardSeq }, dto);

    return ResConfig.Success({ res, statusCode: 'OK', message: '게시물이 수정되었습니다.' });
  }
}
