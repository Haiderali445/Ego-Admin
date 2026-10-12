import assert from 'node:assert/strict';
import { authService } from '../auth/auth.service.js';
import { BaseRepository } from '../base.repository.js';
import { supabase } from '../supabase.client.js';

export async function runCoreTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING AUTOMATED CORE & AUTH TESTS');
  console.log('========================================');

  // Test 1: BaseRepository instantiation
  const repo = new BaseRepository('skills');
  assert.ok(repo, 'BaseRepository must instantiate properly');
  assert.equal(repo.table, 'skills', 'Repository table name must match');

  // Test 2: BaseRepository.getAll() direct DB query (Public Getter)
  const skills = await repo.getAll();
  assert.ok(Array.isArray(skills), 'getAll must return an array');
  assert.ok(skills.length > 0, 'skills table must contain records');
  console.log(`✓ [PASS] BaseRepository.getAll() (Public Getter) -> Fetched ${skills.length} records`);

  // Test 3: BaseRepository.getById() (Public Getter)
  const firstSkill = skills[0];
  const fetchedSkill = await repo.getById(firstSkill.id);
  assert.equal(fetchedSkill.id, firstSkill.id, 'getById must return record with matching primary key');
  console.log(`✓ [PASS] BaseRepository.getById(${firstSkill.id}) (Public Getter) -> Fetched "${fetchedSkill.name}"`);

  // Test 4: Supabase client sanity
  assert.ok(supabase, 'Supabase client instance must be defined');
  const { data: ping, error: pingErr } = await supabase.from('site_config').select('id').limit(1);
  assert.equal(pingErr, null, 'Supabase ping must return zero errors');
  assert.ok(ping.length > 0, 'site_config must respond');
  console.log('✓ [PASS] Supabase Cloud Gateway Ping -> 200 OK');

  // Test 5: 2FA Verification Logic
  assert.throws(
    () => authService.verify2FA('wrong-pin'),
    /Invalid Two-Factor Authentication security code/,
    'Invalid 2FA code must throw error'
  );
  console.log('✓ [PASS] AuthService.verify2FA("wrong-pin") -> Correctly rejected invalid pin');

  const validPin = process.env.VITE_ADMIN_2FA_PIN;
  if (validPin) {
    const verifyResult = authService.verify2FA(validPin);
    assert.equal(verifyResult, true, 'Valid 2FA PIN must return true');
    console.log('✓ [PASS] AuthService.verify2FA() -> Configured PIN verified successfully');
  } else {
    assert.throws(
      () => authService.verify2FA(''),
      /Two-Factor PIN is not configured/,
      '2FA verification must fail closed without a configured PIN'
    );
    console.log('✓ [PASS] AuthService.verify2FA() -> Missing PIN configuration rejected');
  }

  // Test 6: Mutation Authorization Guard Assertion
  // When no active Supabase login session exists, mutation operations MUST be blocked!
  await assert.rejects(
    async () => {
      await repo.insert({ name: 'Unauthorized Test', category: 'Languages' });
    },
    /Active Supabase login session required to mutate records/,
    'Unauthenticated insert must be blocked by mutation guard'
  );
  console.log('✓ [PASS] Mutation Guard -> Blocked unauthenticated insert attempt on repository');

  await assert.rejects(
    async () => {
      await repo.delete(99999);
    },
    /Active Supabase login session required to mutate records/,
    'Unauthenticated delete must be blocked by mutation guard'
  );
  console.log('✓ [PASS] Mutation Guard -> Blocked unauthenticated delete attempt on repository');

  console.log('========================================');
  console.log('🎉 ALL CORE & AUTH TESTS PASSED (6/6)');
  console.log('========================================\n');
  return true;
}

runCoreTests().catch(err => {
  console.error('❌ CORE TEST FAILED:', err);
  process.exit(1);
});
