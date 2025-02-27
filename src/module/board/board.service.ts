import { Injectable } from '@nestjs/common';
import { BoardCommentRepository, BoardRepository, UserRepository } from '../../database/repository';
import { ResConfig } from '../../config';

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
}
