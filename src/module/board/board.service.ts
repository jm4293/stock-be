import { Injectable } from '@nestjs/common';
import { BoardCommentRepository, BoardRepository, UserRepository } from '../../database/repository';
import { ResConfig } from '../../config';
import { CreateBoardCommentDto, CreateBoardDto, UpdateBoardCommentDto, UpdateBoardDto } from '../../type/dto';
import { Request } from 'express';

@Injectable()
export class BoardService {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly boardCommentRepository: BoardCommentRepository,
    private readonly userRepository: UserRepository,
  ) {}

  // 게시판
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

  // 게시판 댓글
  async getBoardCommentList(boardSeq: number) {
    const [boardComments, total] = await this.boardCommentRepository.findAndCount({
      where: { board: { boardSeq }, isDeleted: false },
      order: { createdAt: 'ASC' },
      relations: ['user'],
    });

    return { boardComments, total };
  }

  async createBoardComment(params: { boardSeq: number; dto: CreateBoardCommentDto; req: Request }) {
    const { boardSeq, dto, req } = params;
    const { userSeq } = req.user;
    const { content } = dto;

    const user = await this.userRepository.findUserByUserSeq(userSeq);
    const board = await this.boardRepository.findBoardByBoardSeq(boardSeq);

    const boardComment = this.boardCommentRepository.create({ content, user, board });

    await this.boardCommentRepository.save(boardComment);
  }

  async updateBoardComment(params: {
    boardSeq: number;
    boardCommentSeq: number;
    dto: UpdateBoardCommentDto;
    req: Request;
  }) {
    const { boardSeq, boardCommentSeq, dto, req } = params;
    const { userSeq } = req.user;
    const { content } = dto;

    await this.boardRepository.findBoardByBoardSeq(boardSeq);
    const user = await this.userRepository.findUserByUserSeq(userSeq);
    const boardComment = await this.boardCommentRepository.findBoardCommentByBoardCommentSeq(boardCommentSeq);

    if (boardComment.user.userSeq !== user.userSeq) {
      throw ResConfig.Fail_400({ message: '댓글 작성자만 수정할 수 있습니다.' });
    }

    await this.boardCommentRepository.update({ boardCommentSeq }, { content });
  }

  async deleteBoardComment(params: { boardSeq: number; boardCommentSeq: number; req: Request }) {
    const { boardSeq, boardCommentSeq, req } = params;
    const { userSeq } = req.user;

    await this.boardRepository.findBoardByBoardSeq(boardSeq);
    const user = await this.userRepository.findUserByUserSeq(userSeq);
    const boardComment = await this.boardCommentRepository.findBoardCommentByBoardCommentSeq(boardCommentSeq);

    if (boardComment.user.userSeq !== user.userSeq) {
      throw ResConfig.Fail_400({ message: '댓글 작성자만 삭제할 수 있습니다.' });
    }

    await this.boardCommentRepository.update({ boardCommentSeq }, { isDeleted: true });
  }
}
