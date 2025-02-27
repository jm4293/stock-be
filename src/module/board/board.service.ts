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

  async getBoardList(pageParam: number) {
    const LIMIT = 1;

    const [boards, total] = await this.boardRepository.findAndCount({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
      skip: (pageParam - 1) * LIMIT,
      take: LIMIT,
      relations: ['user'],
    });

    const hasNextPage = pageParam * LIMIT < total;
    const nextPage = hasNextPage ? pageParam + 1 : null;

    return { boards, total, nextPage };
  }

  async getBoardDetail(boardSeq: number) {
    const board = await this.boardRepository.findOne({
      where: { boardSeq },
      relations: ['user'],
    });

    if (!board) {
      throw ResConfig.Fail_400({ message: '게시물이 존재하지 않습니다.' });
    }

    await this.boardRepository.increaseBoardViewCount(boardSeq);

    const commentList = await this.boardCommentRepository.find({
      where: { board: { boardSeq }, isDeleted: false },
      order: { createdAt: 'ASC' },
      relations: ['user'],
    });

    return { board, commentList };
  }

  async createBoard(params: { dto: CreateBoardDto; req: Request }) {
    const { dto, req } = params;
    const { userSeq } = req.user;

    const user = await this.userRepository.findUserByUserSeq(userSeq);

    const board = this.boardRepository.create({ ...dto, user });

    await this.boardRepository.save(board);
  }

  async updateBoard(params: { boardSeq: number; dto: UpdateBoardDto; req: Request }) {
    const { boardSeq, dto, req } = params;
    const { userSeq } = req.user;

    const user = await this.userRepository.findUserByUserSeq(userSeq);

    const board = await this.boardRepository.findBoardByBoardSeq(boardSeq);

    if (board.user.userSeq !== user.userSeq) {
      throw ResConfig.Fail_400({ message: '게시물 작성자만 수정할 수 있습니다.' });
    }

    await this.boardRepository.update({ boardSeq }, dto);
  }

  async deleteBoard(params: { boardSeq: number; req: Request }) {
    const { boardSeq, req } = params;
    const { userSeq } = req.user;

    const user = await this.userRepository.findUserByUserSeq(userSeq);

    const board = await this.boardRepository.findBoardByBoardSeq(boardSeq);

    if (board.user.userSeq !== user.userSeq) {
      throw ResConfig.Fail_400({ message: '게시물 작성자만 삭제할 수 있습니다.' });
    }

    await this.boardRepository.update({ boardSeq }, { isDeleted: true });
  }
}
