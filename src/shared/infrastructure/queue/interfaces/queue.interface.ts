export interface JobOptions {
    priority?: number;
    delay?: number;
    attempts?: number;
    backoff?: {
        type: 'exponential' | 'fixed';
        delay: number;
    };
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
}

export interface IQueueService {
    add<T = unknown>(
        queueName: string,
        jobName: string,
        data: T,
        options?: JobOptions,
    ): Promise<string>;

    addUnique<T = unknown>(
        queueName: string,
        jobName: string,
        data: T,
        uniqueKey: string,
        ttl?: number,
    ): Promise<string | null>;

    remove(queueName: string, jobId: string): Promise<void>;
    clean(queueName: string): Promise<void>;
    pause(queueName: string): Promise<void>;
    resume(queueName: string): Promise<void>;
}
