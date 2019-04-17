const assert = require('assert');

const { AuthenticationClient, DataManagementClient } = require('..');

describe('DataManagementClient', function() {
    beforeEach(function() {
        const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, FORGE_BUCKET } = process.env;
        assert(FORGE_CLIENT_ID);
        assert(FORGE_CLIENT_SECRET);
        assert(FORGE_BUCKET);
        const auth = new AuthenticationClient(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET);
        this.client = new DataManagementClient(auth);
        this.bucket = FORGE_BUCKET;
        this.timeout(5000); // Increase timeout to 5 seconds
    });

    describe('buckets()', function() {
        it('should return a list of buckets', async function() {
            const buckets = await this.client.buckets();
            assert(buckets.length > 0);
        });
    });

    describe('bucketsPager()', function() {
        it('should iterate over buckets', async function() {
            for await (const buckets of this.client.bucketsPager()) {
                assert(buckets.length > 0);
                break;
            }
        });
    });

    describe('bucketDetails()', function() {
        it('should return bucket info', async function() {
            const details = await this.client.bucketDetails(this.bucket);
            assert(details);
            assert(details.bucketKey === this.bucket);
            assert(details.bucketOwner);
            assert(details.createdDate);
            assert(details.permissions);
            assert(details.policyKey);
        });
    });

    describe('createBucket()', function() {
        /* Don't want to create a new bucket on every test run... */
        // it('should create a new bucket', async function() {
        //     const bucket = await this.client.createBucket('test.123456', 'transient');
        //     assert(bucket);
        //     console.log(bucket);
        // });

        it('should fail because a bucket with this name already exists', function(done) {
            this.client.createBucket(this.bucket, 'transient')
                .catch((err) => {
                    //console.log(err);
                    done();
                });
        });
    });

    describe('objects()', function() {
        it('should return a list of objects', async function() {
            const objects = await this.client.objects(this.bucket);
            assert(objects.length > 0);
        });
    });

    describe('objectsPager()', function() {
        it('should iterate over objects', async function() {
            for await (const objects of this.client.objectsPager(this.bucket)) {
                assert(objects.length > 0);
                break;
            }
        });
    });

    describe('uploadObject()', function() {
        it('should upload object content', async function() {
            const objectName = 'test-file';
            const buff = Buffer.from('This is a test string!', 'utf8');
            const result = await this.client.uploadObject(this.bucket, objectName, 'text/plain; charset=UTF-8', buff);
            assert(result);
            assert(result.location);
            assert(result.location.indexOf(objectName) !== -1);
        });
    });

    describe('downloadObject()', function() {
        it('should download object content', async function() {
            const objectName = 'test-file';
            const content = await this.client.downloadObject(this.bucket, objectName);
            assert(content.indexOf('This is a test string!') !== -1);
        });
    });

    describe('objectDetails()', function() {
        it('should return object info', async function() {
            const details = await this.client.objectDetails(this.bucket, 'test-file');
            assert(details.bucketKey === this.bucket);
            assert(details.objectId);
            assert(details.objectKey === 'test-file');
        });
    });
});