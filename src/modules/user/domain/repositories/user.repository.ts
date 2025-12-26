import type {
    CreateAccountInput,
    CreateUserInput,
    UpdateUserInput,
    User,
} from '../entities/user.entity';

export interface IUserRepository {
    /**
     * Find user by ID
     */
    findById(id: string): Promise<User | null>;

    /**
     * Find user by email (through accounts)
     */
    findByEmail(email: string): Promise<User | null>;

    /**
     * Create user with account
     */
    createWithAccount(user: CreateUserInput, account: CreateAccountInput): Promise<User>;

    /**
     * Update user by ID
     */
    update(id: string, data: UpdateUserInput): Promise<User>;

    /**
     * Activate user (set status to ACTIVE, role to USER, verifiedAt)
     */
    activate(id: string, email: string): Promise<User>;
}
