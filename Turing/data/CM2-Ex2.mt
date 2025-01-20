/**  States **/
q0
q1
q2
q3

/**  Input symbols **/
1

/**  Tape alphabet **/
1
#

/**  Blank symbol **/
#

/**  Initial state **/
q0

/**  Final states **/
q3

/**  Transitions **/
q0,1->q1,1,R
q0,#->q2,#,L
q1,1->q0,1,R
q1,#->q3,#,R
q2,1->q2,1,L
q2,#->q0,#,R